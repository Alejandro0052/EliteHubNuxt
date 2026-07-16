from playwright.sync_api import Page


class NutritionistsPage:
    
    def __init__(self, page: Page):
       
        self.page = page
        
        self.nutritionists_section = "h2:has-text('Nutricionistas')"  
        self.join_now_link = "a:has-text('Únete ahora')" 
    

    def click_nutritionists_section(self) -> None:
        self.page.click(self.nutritionists_section)
    

    def scroll_to_bottom(self) -> None:
       
        self.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    

    def click_join_now(self) -> None:
      
        self.page.click(self.join_now_link)
    

    def complete_nutritionists_flow(self) -> None:
 
        self.click_nutritionists_section()
        self.page.wait_for_timeout(1000)  
        self.scroll_to_bottom()
        self.page.wait_for_timeout(1000)  
        self.click_join_now()
