const releaseAgeExclusions = ['@codicus/*'];

export const hooks = {
    updateConfig(config) {
        const minimumReleaseAgeExclude = [
            ...new Set([...(config.minimumReleaseAgeExclude ?? []), ...releaseAgeExclusions]),
        ];

        return Object.assign(config, {
            blockExoticSubdeps: true,
            dangerouslyAllowAllBuilds: false,
            engineStrict: true,
            minimumReleaseAge: 1440,
            minimumReleaseAgeExclude,
            minimumReleaseAgeStrict: true,
            strictDepBuilds: true,
            trustPolicy: 'no-downgrade',
        });
    },
};
