// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import Maps from './components/MapsController.js/Maps';
import Items from './components/ItemController/Items';
import Scarabs from './components/ScarabController/Scarabs';
import AdBanner from './components/AdBanner';
import Support from './components/Support';
import './style/global.css';

const App = () => (
	<Router>
		<div className="container">
			<div className="sidebar">
				<h2>POE regex TW</h2>
				<ul>
					<li><Link to="/maps">地圖詞綴</Link></li>
					<li><Link to="/scarabs">聖甲蟲</Link></li>
					{/* <li><Link to="/items">物品詞綴</Link></li> */}
					<li><a href="https://www.poepricer.com/" target="_blank" rel="noopener noreferrer">通貨物價</a></li>
				</ul>
				<AdBanner containerId="ad-container-160x300" adKey="8aa48f28f44655793a58aa6ec898cc28" width={160} height={300} />
				<AdBanner containerId="ad-container-300x250" adKey="e0006c1ec20d7b2bf6f267f58d569650" width={300} height={250} />
				<ul style={{ marginTop: '20px' }}>
					<li><Link to="/support">贊助支持</Link></li>
				</ul>
			</div>
			<div className="main">
				<Routes>
					<Route path="/maps" element={<Maps/>}/>
					<Route path="/scarabs" element={<Scarabs/>}/>
					<Route path="/items" element={<Items/>}/>
					<Route path="/support" element={<Support/>}/>
					<Route exact path="/" element={<Home/>}/>
				</Routes>
			</div>
		</div>
	</Router>
);

const Home = () => (
	<div>
		<h2>歡迎使用 POE regex TW</h2>
		<p>請選擇左側功能開始使用。</p>
	</div>
);

export default App;
