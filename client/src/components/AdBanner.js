import React, { useEffect } from 'react';

const AdBanner = ({ adKey, width, height, containerId }) => {
	useEffect(() => {
		const loadAd = (containerIdParam, key, widthParam, heightParam) => {
			return new Promise((resolve) => {
				const container = document.getElementById(containerIdParam);

				if (!container || container.querySelector(`script[src*="${key}"]`)) {
					resolve();
					return;
				}

				window.atOptions = {
					key: key,
					format: 'iframe',
					height: heightParam,
					width: widthParam,
					params: {},
				};

				const script = document.createElement('script');

				script.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
				script.onload = () => setTimeout(resolve, 300);
				script.onerror = resolve;
				container.appendChild(script);
			});
		};

		const tryLoad = async () => {
			const container = document.getElementById(containerId);

			if (!container) {
				setTimeout(tryLoad, 50);
				return;
			}

			await loadAd(containerId, adKey, width, height);
		};

		setTimeout(tryLoad, 100);
	}, [adKey, width, height, containerId]);

	return (
		<div
			id={containerId}
			style={{
				width: `${width}px`,
				minHeight: `${height}px`,
				margin: '10px auto',
			}}
		/>
	);
};

export default AdBanner;
