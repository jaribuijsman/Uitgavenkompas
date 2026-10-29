'use strict';
// Use the real disclosure controls before interacting with a folded native field.
module.exports=async function reveal(page,selector){
 const target=page.locator(selector).first();
 for(const details of (await target.locator('xpath=ancestor::details[not(@open)]').all()).reverse())await details.locator(':scope > summary').click();
};
