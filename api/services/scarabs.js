const scarabNameMap = require('../lib/scarab-name-map.json');

/**
 * 根據選擇的聖甲蟲名稱產生 regex
 * @param {string[]} selectedNames - 選擇的聖甲蟲名稱陣列
 * @returns {string} 產生的 regex
 */
function generateScarabRegex(selectedNames) {
	if (!selectedNames || selectedNames.length === 0) {
		return '';
	}

	// 將選擇的名稱轉換為短代碼
	const shortCodes = selectedNames
		.map((name) => scarabNameMap[name])
		.filter(Boolean);

	if (shortCodes.length === 0) {
		return '';
	}

	// 去重複
	const uniqueCodes = [...new Set(shortCodes)];

	// 組合為 regex，格式： "code1|code2|code3"
	return `"${uniqueCodes.join('|')}"`;
}

module.exports = {
	generateScarabRegex,
};

