const express = require('express');
const {
	handleGetScarabsRequest,
	handleGenerateScarabRegexRequest,
} = require('../route-handlers/scarabs');

const router = new express.Router();

router.get(
	'/',
	handleGetScarabsRequest,
);

router.post(
	'/generateRegex',
	handleGenerateScarabRegexRequest,
);

module.exports = router;

