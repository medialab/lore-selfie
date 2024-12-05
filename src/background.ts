import browser from "webextension-polyfill";

browser.runtime.onInstalled.addListener(() => {
  browser.menus.onClicked.addListener((info, tab) => {
		console.log({info, tab})
	});
	browser.menus.create({
		id: 'test',
		title: 'test selection',
		contexts: ['selection']
	});

	console.log('Extension installed');
  alert('extension installed !');
});
