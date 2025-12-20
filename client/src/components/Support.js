import React from 'react';
import { Link } from 'react-router-dom';
import './Support.css';

const Support = () => {
	return (
		<div className="page-container">
			<div className="page-content">
				<div className="page-nav">
					<Link to="/" className="back-link">← 返回首頁</Link>
				</div>
				<h1 className="page-title">❤️ 贊助支持</h1>
				<div className="page-body">
					<p>
						若您願意支持網站的持續發展，歡迎透過以下方式給予支持。<br />
						<br />
						您的每一份贊助都是本站前進的莫大動力！<br />
					</p>

					<div className="support-options">
						<a
							href="https://www.patreon.com/c/poe_pricer_tw"
							target="_blank"
							rel="noopener noreferrer"
							className="support-link patreon-link"
						>
							<img
								src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Patreon_logo_with_wordmark.svg/512px-Patreon_logo_with_wordmark.svg.png"
								alt="Patreon"
								className="support-logo"
							/>
							<span className="support-text">成為 Patreon 會員</span>
						</a>

						<a
							href="https://paypal.me/shihyao001"
							target="_blank"
							rel="noopener noreferrer"
							className="support-link paypal-link"
						>
							<img
								src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/512px-PayPal.svg.png"
								alt="PayPal"
								className="support-logo"
							/>
							<span className="support-text">透過 PayPal 支持</span>
						</a>
					</div>

					<div className="ecpay-section">
						<h2 className="ecpay-title">PortalY 斗內</h2>
						<div className="ecpay-content">
							<a
								href="https://portaly.cc/poepricer/support"
								target="_blank"
								rel="noopener noreferrer"
								className="ecpay-button"
							>
								前往贊助
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Support;

