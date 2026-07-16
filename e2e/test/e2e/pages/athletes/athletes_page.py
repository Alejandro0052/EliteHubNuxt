from playwright.sync_api import Page


class AthletesPage:
    
    def __init__(self, page: Page):
       
        self.page = page
        
        self.athletes_section = "h2:has-text('deportistas')"  
        self.start_now_link = "a:has-text('comenzar ahora')" 
    

    def click_athletes_section(self) -> None:
        self.page.click(self.athletes_section)
    

    def scroll_to_bottom(self) -> None:
       
        self.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    

    def click_start_now(self) -> None:
      
        self.page.click(self.start_now_link)
    

    def complete_athletes_flow(self) -> None:
 
        self.click_athletes_section()
        self.page.wait_for_timeout(1000)  
        self.scroll_to_bottom()
        self.page.wait_for_timeout(1000)  
        self.click_start_now()
