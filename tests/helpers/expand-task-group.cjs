'use strict';
// Follow the real disclosure control when a journey needs a task inside it.
module.exports=async function expandTaskGroup(page,selector){
 const group=page.locator(selector).first().locator('xpath=ancestor::details[contains(@class,"memento-task-category")]');
 if(await group.count()&&await group.getAttribute('open')===null)await group.locator(':scope>summary').click();
};
