const https = require('https');

module.exports = async (req, res) => {
	try {
		const url = 'https://www.poepricer.com/api/v1/poe1/currency/latest?category=Scarabs';

		https.get(url, (apiRes) => {
			let data = '';

			apiRes.on('data', (chunk) => {
				data += chunk;
			});

			apiRes.on('end', () => {
				try {
					const scarabs = JSON.parse(data);
					res.status(200).json(scarabs);
				} catch (error) {
					console.error('Failed to parse scarabs data:', error);
					res.status(500).json({ error: 'Failed to parse scarabs data' });
				}
			});
		}).on('error', (error) => {
			console.error('Failed to fetch scarabs:', error);
			res.status(500).json({ error: 'Failed to fetch scarabs' });
		});
	} catch (error) {
		console.error('Failed to get scarabs:', error);
		res.status(500).json({ error: 'Failed to get scarabs' });
	}
};

