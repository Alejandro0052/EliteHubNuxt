import os

from playwright.sync_api import Page

BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:3000")


class LoginPage:

    def __init__(self, page: Page):
        self.page = page

        self.email_input = "#email"
        self.password_input = "#password"
        self.submit_button = "button[type='submit']"
        self.logged_out_link = "a:has-text('Iniciar sesión')"

    def goto(self) -> None:
        self.page.goto(f"{BASE_URL}/login")

    def login(self, email: str, password: str) -> None:
        self.goto()
        self.page.fill(self.email_input, email)
        self.page.fill(self.password_input, password)
        self.page.click(self.submit_button)
        self.page.wait_for_load_state("networkidle")

    def is_logged_in(self) -> bool:
        self.page.wait_for_timeout(1000)
        return self.page.locator(self.logged_out_link).count() == 0
