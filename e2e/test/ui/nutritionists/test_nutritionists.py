import pytest
import sys
from pathlib import Path


sys.path.insert(0, str(Path(__file__).parents[2] / "e2e" / "pages"))

from login_page import LoginPage
from nutritionists.nutritionists_page import NutritionistsPage


class TestNutritionistsPageFlow:

    
    def test_complete_nutritionists_flow(self, page):

        login_page = LoginPage(page)
        nutritionists_page = NutritionistsPage(page)
        
       
        login_page.login(
            email="mariaeugenialopez456@gmail.com",
            password="1234"
        )
        
    
        assert login_page.is_logged_in(), "Login was not successful"
        
      
        nutritionists_page.complete_nutritionists_flow()
        
        
       
    
    def test_nutritionists_flow_step_by_step(self, page):
     
        login_page = LoginPage(page)
        nutritionists_page = NutritionistsPage(page)
        
      
        login_page.login(
            email="mariaeugenialopez456@gmail.com",
            password="1234"
        )
        assert login_page.is_logged_in(), "Login was not successful"
         
        nutritionists_page.click_nutritionists_section()
         
        nutritionists_page.scroll_to_bottom()
     
        nutritionists_page.click_join_now()
        page.wait_for_timeout(2000)

      