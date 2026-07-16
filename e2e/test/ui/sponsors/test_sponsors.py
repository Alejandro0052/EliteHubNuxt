import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[2] / "e2e" / "pages"))

from login_page import LoginPage
from sponsors.sponsors_page import SponsorsPage


class TestSponsorsFlow:

    def test_complete_sponsors_flow(self, page):
        login_page = LoginPage(page)
        sponsors_page = SponsorsPage(page)

        login_page.login(
            email="mariaeugenialopez456@gmail.com",
            password="1234"
        )

        assert login_page.is_logged_in(), "Login was not successful"

        sponsors_page.complete_sponsors_flow()

    def test_sponsors_flow_step_by_step(self, page):
        login_page = LoginPage(page)
        sponsors_page = SponsorsPage(page)

        login_page.login(
            email="mariaeugenialopez456@gmail.com",
            password="1234"
        )
        assert login_page.is_logged_in(), "Login was not successful"

        sponsors_page.click_sponsors_section()
        page.wait_for_timeout(1000)

        sponsors_page.scroll_to_bottom()
        page.wait_for_timeout(1000)

        sponsors_page.click_contact_now()
        page.wait_for_timeout(2000)
