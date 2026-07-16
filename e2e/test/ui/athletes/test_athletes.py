import pytest
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).parents[2] / "e2e" / "pages"))

from login_page import LoginPage
from athletes.athletes_page import AthletesPage


class TestAthletesFlow:

    
    def test_complete_athletes_flow(self, page):

        login_page = LoginPage(page)
        athletes_page = AthletesPage(page)
        
       
        login_page.login(
            email="mariaeugenialopez456@gmail.com",
            password="1234"
        )
        
    
        assert login_page.is_logged_in(), "Login was not successful"
        
      
        athletes_page.complete_athletes_flow()
        
        page.wait_for_timeout(2000)
        
       
    
    def test_athletes_flow_step_by_step(self, page):
     
        login_page = LoginPage(page)
        athletes_page = AthletesPage(page)
        
      
        login_page.login(
            email="mariaeugenialopez456@gmail.com",
            password="1234"
        )
        assert login_page.is_logged_in(), "Login was not successful"
        
       
        athletes_page.click_athletes_section()
        page.wait_for_timeout(1000)
        
       
        athletes_page.scroll_to_bottom()
        page.wait_for_timeout(1000)
        
   
        athletes_page.click_start_now()
        page.wait_for_timeout(2000)
        