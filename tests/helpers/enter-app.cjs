"use strict";
module.exports=async function enterApp(page,first=false){
 await page.waitForFunction(()=>window.MementoStart||document.documentElement.dataset.mementoPinLock!=='manual');
 if(await page.locator('#ms-continue').isVisible())await page.locator('#ms-continue').click({noWaitAfter:true});
 else if(await page.locator('#pinForm').isVisible()){
  await page.locator('#pinInput').fill('123456');await page.locator('#pinSubmit').click();
  if(first){await page.locator('#pinInput').fill('123456');await page.locator('#pinSubmit').click();}
 }
 await page.locator('#pinLock').waitFor({state:'hidden'});
};
