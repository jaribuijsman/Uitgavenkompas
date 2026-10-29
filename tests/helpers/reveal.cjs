'use strict';
// Use the real disclosure controls before interacting with a folded native field.
module.exports=async function reveal(page,selector){
 const target=(typeof selector==='string'?page.locator(selector):selector).first();
 const form=await target.evaluate(el=>el.closest('#txForm,#lifeTaskForm')?.id||'');
 if(form)await page.locator('#'+form+'[data-mg-ready]').waitFor();
 // Other view decorations are scheduled at the next frame, before a person can tap.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 for(const details of (await target.locator('xpath=ancestor::details[not(@open)]').all()).reverse())await details.locator(':scope > summary').click();
};
