const SCARABS_URL = 'https://www.poepricer.com/api/v1/poe1/currency/latest?category=Scarabs';

module.exports = async (req, res) => {
	try {
		const apiRes = await fetch(SCARABS_URL);

		if (!apiRes.ok) {
			console.error('Failed to fetch scarabs:', apiRes.status, apiRes.statusText);
			res.status(502).json({ error: 'Failed to fetch scarabs' });
			return;
		}

		const scarabs = await apiRes.json();
		res.status(200).json(scarabs);
	} catch (error) {
		console.error('Failed to get scarabs:', error);
		res.status(500).json({ error: 'Failed to get scarabs' });
	}
};
