export type OxlintConfig = {
    categories?: Record<string, 'error' | 'warn' | 'off'>;
    env?: Record<string, boolean>;
    extends?: OxlintConfig[];
    ignorePatterns?: string[];
    jsPlugins?: { name: string; specifier: string }[];
    options?: Record<string, unknown>;
    overrides?: {
        files: string[];
        env?: Record<string, boolean>;
        plugins?: string[];
        rules?: Record<string, unknown>;
    }[];
    plugins?: string[];
    rules?: Record<string, unknown>;
};
