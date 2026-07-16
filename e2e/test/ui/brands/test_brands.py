import pytest
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).parents[2] / "e2e" / "pages"))

from login_page import LoginPage
from brands.brands_page import BrandsPage


class TestBrandsFlow:

    
    def test_complete_brands_flow(self, page):

        login_page = LoginPage(page)
        brands_page = BrandsPage(page)
        
       
        login_page.login(
            email="mariaeugenialopez456@gmail.com",
            password="1234"
        )
        
    
        assert login_page.is_logged_in(), "Login was not successful"
        
      
        brands_page.complete_brands_flow()
        
        
       
    
    def test_brands_flow_step_by_step(self, page):
     
        login_page = LoginPage(page)
        brands_page = BrandsPage(page)
        
      
        login_page.login(
            email="mariaeugenialopez456@gmail.com",
            password="1234"
        )
        assert login_page.is_logged_in(), "Login was not successful"
        
       
        brands_page.click_brands_section()
    
        
       
        brands_page.scroll_to_bottom()
     
        
   
        brands_page.click_join_now()
      