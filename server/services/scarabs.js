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

	// 去重複；較長代碼放前，讓 | 交替時先嘗試較具體的 pattern（減少子字串互相包含造成的誤匹配）
	const uniqueCodes = [...new Set(shortCodes)];

	uniqueCodes.sort((a, b) => {
		if (b.length !== a.length) {
			return b.length - a.length;
		}

		return a.localeCompare(b, 'zh-Hant');
	});

	// 組合為 regex，格式： "code1|code2|code3"
	return `"${uniqueCodes.join('|')}"`;
}

module.exports = {
	generateScarabRegex,
};

