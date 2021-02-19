const blacklist = require('metro-config/src/defaults/blacklist');
module.exports = {
	resolver: {
		blacklistRE: blacklist([/#current-cloud-backend\/.*/]),
	},
	transformer: {
		assetPlugins: ['expo-asset/tools/hashAssetFiles'],
		getTransformOptions: async () => ({
			transform: {
				experimentalImportSupport: false,
				inlineRequires: false,
			},
		}),
	},
};