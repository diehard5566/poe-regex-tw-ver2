const { generateScarabRegex } = require('../../services/scarabs');

module.exports = async (req, res) => {
	const { selectedNames } = req.body;

	try {
		const regex = generateScarabRegex(selectedNames);

		res.status(201).json({ regex });
	} catch (error) {
		console.error('Failed to generate scarab regex:', error);
		res.status(500).json({ error: 'Failed to generate scarab regex' });
	}
};

