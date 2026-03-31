import React from 'react';
import { Link } from 'react-router-dom';
import './Support.css';

const Support = () => {
	const donateURL = 'https://payment.opay.tw/Broadcaster/Donate/A88A8507787D65A4F01A269BB4EE75C0';

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

					<div className="opay-section">
						<p>歐付寶 點圖進入贊助！</p>
						<a
							href={donateURL}
							target="_blank"
							rel="noopener noreferrer"
							className="opay-banner-link"
							aria-label="前往歐付寶收款頁（另開視窗）"
						>
							<img
								src="/opay-banner.png"
								alt="歐付寶 斗內 / 贊助"
								className="opay-banner"
							/>
						</a>

						<a
							href={donateURL}
							target="_blank"
							rel="noopener noreferrer"
							className="opay-twqr-link"
							aria-label="前往歐付寶收款頁（TWQR 行動支付）"
						>
							<img
								src="https://payment.opay.tw/Upload/TWQRSticker/20260331/1/2499550.png"
								alt="TWQR 行動支付收款 QR Code"
								className="opay-twqr"
							/>
							<div className="opay-methods">
								（可支援歐付寶/街口支付/一卡通/全支付/悠遊付/全盈+PAY/icash Pay/橘子支付/簡單付/台灣Pay付款）
							</div>
						</a>
					</div>

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
				</div>
			</div>
		</div>
	);
};

export default Support;

