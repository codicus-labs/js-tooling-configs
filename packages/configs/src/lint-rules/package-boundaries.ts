import { existsSync, globSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import type { ESTree, Rule } from '@oxlint/plugins';

type JsonObject = Record<string, unknown>;

type PackageManifest = {
    readonly directory: string;
    readonly name: string | null;
    readonly exports: unknown;
};

type Workspace = {
    readonly directory: string;
    readonly members: ReadonlySet<string>;
};

const manifestCache = new Map<string, PackageManifest | null>();
const workspaceCache = new Map<string, Workspace>();
const sourceExtensions = ['.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx', '.svelte', '.json'];

function isObject(value: unknown): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readManifest(directory: string): PackageManifest | null {
    const manifestPath = join(directory, 'package.json');
    const cached = manifestCache.get(manifestPath);
    if (cached !== undefined) return cached;

    try {
        const json: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
        const manifest = isObject(json)
            ? {
                  directory,
                  name: typeof json.name === 'string' ? json.name : null,
                  exports: json.exports,
              }
            : null;
        manifestCache.set(manifestPath, manifest);
        return manifest;
    } catch {
        manifestCache.set(manifestPath, null);
        return null;
    }
}

function nearestPackage(startPath: string): PackageManifest | null {
    let current = startPath;
    try {
        if (!statSync(current).isDirectory()) current = dirname(current);
    } catch {
        current = extname(current) === '' ? current : dirname(current);
    }

    while (true) {
        const manifest = readManifest(current);
        if (manifest !== null) return manifest;
        const parent = dirname(current);
        if (parent === current) return null;
        current = parent;
    }
}

function packageWorkspacePatterns(manifestPath: string): string[] | null {
    try {
        const json: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
        if (!isObject(json)) return null;
        const workspaces = json.workspaces;
        if (Array.isArray(workspaces) && workspaces.every((pattern) => typeof pattern === 'string')) {
            return workspaces;
        }
        if (
            isObject(workspaces) &&
            Array.isArray(workspaces.packages) &&
            workspaces.packages.every((pattern) => typeof pattern === 'string')
        ) {
            return workspaces.packages;
        }
    } catch {
        // A malformed manifest cannot prove workspace membership.
    }
    return null;
}

function pnpmWorkspacePatterns(workspacePath: string): string[] {
    const patterns: string[] = [];
    try {
        const lines = readFileSync(workspacePath, 'utf8').split(/\r?\n/u);
        let packagesIndent: number | null = null;
        for (const line of lines) {
            const packagesMatch = /^(\s*)packages:\s*(?:#.*)?$/u.exec(line);
            if (packagesMatch !== null) {
                packagesIndent = packagesMatch[1]?.length ?? 0;
                continue;
            }
            if (packagesIndent === null || /^\s*(?:#.*)?$/u.test(line)) continue;

            const indent = /^\s*/u.exec(line)?.[0].length ?? 0;
            if (indent <= packagesIndent) break;
            const item = /^\s*-\s*(.+?)\s*$/u.exec(line)?.[1];
            if (item === undefined) continue;
            const withoutComment = item.replace(/\s+#.*$/u, '').trim();
            const unquoted =
                (withoutComment.startsWith("'") && withoutComment.endsWith("'")) ||
                (withoutComment.startsWith('"') && withoutComment.endsWith('"'))
                    ? withoutComment.slice(1, -1)
                    : withoutComment;
            if (unquoted !== '') patterns.push(unquoted);
        }
    } catch {
        // The marker still identifies the root, but no package membership is assumed.
    }
    return patterns;
}

function memberDirectories(root: string, patterns: readonly string[]): ReadonlySet<string> {
    const members = new Set<string>();
    const apply = (pattern: string, remove: boolean) => {
        const normalized = pattern.replace(/\\/gu, '/').replace(/\/$/u, '');
        if (normalized === '' || isAbsolute(normalized)) return;
        for (const manifestPath of globSync(`${normalized}/package.json`, { cwd: root })) {
            try {
                const directory = realpathSync(dirname(join(root, manifestPath)));
                if (remove) members.delete(directory);
                else members.add(directory);
            } catch {
                // Ignore entries that disappear during discovery.
            }
        }
    };

    for (const pattern of patterns) {
        if (!pattern.startsWith('!')) apply(pattern, false);
    }
    for (const pattern of patterns) {
        if (pattern.startsWith('!')) apply(pattern.slice(1), true);
    }
    return members;
}

function findWorkspace(filename: string): Workspace | null {
    let current = dirname(filename);
    while (true) {
        const pnpmWorkspacePath = join(current, 'pnpm-workspace.yaml');
        const packageManifestPath = join(current, 'package.json');
        let patterns: string[] | null = null;
        if (existsSync(pnpmWorkspacePath)) patterns = pnpmWorkspacePatterns(pnpmWorkspacePath);
        else patterns = packageWorkspacePatterns(packageManifestPath);

        if (patterns !== null) {
            const cached = workspaceCache.get(current);
            if (cached !== undefined) return cached;
            try {
                const workspace = {
                    directory: current,
                    members: memberDirectories(current, patterns),
                };
                workspaceCache.set(current, workspace);
                return workspace;
            } catch {
                return null;
            }
        }

        const parent = dirname(current);
        if (parent === current) return null;
        current = parent;
    }
}

function canonicalExistingPath(path: string): string {
    try {
        return realpathSync(path);
    } catch {
        return path;
    }
}

function existingRelativeTarget(filename: string, specifier: string): string | null {
    const target = resolve(dirname(filename), specifier);
    const candidates = [target];
    if (extname(target) === '') {
        candidates.push(...sourceExtensions.map((extension) => `${target}${extension}`));
        candidates.push(...sourceExtensions.map((extension) => join(target, `index${extension}`)));
    }
    for (const candidate of candidates) {
        try {
            if (statSync(candidate).isFile()) return candidate;
        } catch {
            // Try the next conventional source resolution candidate.
        }
    }
    return null;
}

function packageSpecifier(specifier: string): { name: string; subpath: string } | null {
    if (specifier.startsWith('@')) {
        const [scope, packageName, ...subpath] = specifier.split('/');
        if (scope === '' || packageName === undefined || packageName === '') return null;
        return { name: `${scope}/${packageName}`, subpath: subpath.length === 0 ? '.' : `./${subpath.join('/')}` };
    }
    const [packageName, ...subpath] = specifier.split('/');
    if (packageName === undefined || packageName === '') return null;
    return { name: packageName, subpath: subpath.length === 0 ? '.' : `./${subpath.join('/')}` };
}

function installedWorkspacePackage(
    filename: string,
    packageName: string,
    workspace: Workspace,
): PackageManifest | null {
    let current = dirname(filename);
    while (true) {
        const linkedDirectory = join(current, 'node_modules', ...packageName.split('/'));
        try {
            const realDirectory = realpathSync(linkedDirectory);
            if (workspace.members.has(realDirectory)) {
                const manifest = readManifest(realDirectory);
                if (manifest?.name === packageName) return manifest;
            }
        } catch {
            // Continue at the next node_modules directory.
        }

        if (current === workspace.directory) return null;
        const parent = dirname(current);
        if (parent === current || relative(workspace.directory, parent).startsWith(`..${sep}`)) return null;
        current = parent;
    }
}

function hasPublicTarget(target: unknown): boolean {
    if (typeof target === 'string') return true;
    if (Array.isArray(target)) return target.some(hasPublicTarget);
    if (isObject(target)) return Object.values(target).some(hasPublicTarget);
    return false;
}

function matchingPattern(exports: JsonObject, subpath: string): unknown {
    let selected: { prefixLength: number; keyLength: number; target: unknown } | null = null;
    for (const [key, target] of Object.entries(exports)) {
        const star = key.indexOf('*');
        if (!key.startsWith('./') || star === -1 || star !== key.lastIndexOf('*')) continue;
        const prefix = key.slice(0, star);
        const suffix = key.slice(star + 1);
        if (
            !subpath.startsWith(prefix) ||
            !subpath.endsWith(suffix) ||
            subpath.length < prefix.length + suffix.length
        ) {
            continue;
        }
        if (
            selected === null ||
            prefix.length > selected.prefixLength ||
            (prefix.length === selected.prefixLength && key.length > selected.keyLength)
        ) {
            selected = { prefixLength: prefix.length, keyLength: key.length, target };
        }
    }
    return selected?.target;
}

function isExported(exports: unknown, subpath: string): boolean {
    if (!isObject(exports) || Object.keys(exports).every((key) => !key.startsWith('.'))) {
        return subpath === '.' && hasPublicTarget(exports);
    }
    if (Object.hasOwn(exports, subpath)) return hasPublicTarget(exports[subpath]);
    return hasPublicTarget(matchingPattern(exports, subpath));
}

function lintFilename(context: { readonly filename: string; readonly physicalFilename: string }): string | null {
    for (const filename of [context.physicalFilename, context.filename]) {
        if (filename !== '' && filename !== '<input>' && filename !== '<text>' && isAbsolute(filename)) return filename;
    }
    return null;
}

export const packageBoundaries: Rule = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Keep workspace package imports behind package.json exports.',
        },
        messages: {
            crossPackageRelative:
                'Relative imports may not cross package boundaries. Import the target package through its public exports.',
            privatePackagePath:
                '"{{specifier}}" is not a public package.json export of workspace package "{{packageName}}".',
        },
    },
    create(context) {
        const filename = lintFilename(context);
        if (filename === null) return {};
        const importerPackage = nearestPackage(canonicalExistingPath(filename));
        const workspace = findWorkspace(filename);

        const check = (node: ESTree.Node, specifier: string) => {
            if (specifier.startsWith('.')) {
                const target = existingRelativeTarget(filename, specifier);
                if (target === null) return;
                const targetPackage = nearestPackage(canonicalExistingPath(target));
                if (
                    importerPackage !== null &&
                    targetPackage !== null &&
                    importerPackage.directory !== targetPackage.directory
                ) {
                    context.report({ node, messageId: 'crossPackageRelative' });
                }
                return;
            }

            if (workspace === null || specifier.startsWith('#') || isAbsolute(specifier)) return;
            const parsed = packageSpecifier(specifier);
            if (parsed === null) return;
            const targetPackage = installedWorkspacePackage(filename, parsed.name, workspace);
            if (targetPackage !== null && !isExported(targetPackage.exports, parsed.subpath)) {
                context.report({
                    node,
                    messageId: 'privatePackagePath',
                    data: { packageName: parsed.name, specifier },
                });
            }
        };

        const checkLiteral = (node: ESTree.Node) => {
            if (node.type === 'Literal' && typeof node.value === 'string') check(node, node.value);
        };

        return {
            ImportDeclaration(node) {
                checkLiteral(node.source);
            },
            ExportAllDeclaration(node) {
                checkLiteral(node.source);
            },
            ExportNamedDeclaration(node) {
                if (node.source !== null) checkLiteral(node.source);
            },
            ImportExpression(node) {
                checkLiteral(node.source);
            },
        };
    },
};
