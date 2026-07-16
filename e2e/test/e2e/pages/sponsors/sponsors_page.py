from playwright.sync_api import Page


class SponsorsPage:
    def __init__(self, page: Page):
        self.page = page
        self.sponsors_section = "h2:has-text('patrocinadores')"
        self.contact_now_link = "a:has-text('Contactar Ahora')"

    def click_sponsors_section(self) -> None:
        self.page.click(self.sponsors_section)

    def scroll_to_bottom(self) -> None:
        self.page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

    def click_contact_now(self) -> None:
        self.page.click(self.contact_now_link)

    def complete_sponsors_flow(self) -> None:
        self.click_sponsors_section()
        self.page.wait_for_timeout(1000)
        self.scroll_to_bottom()
        self.page.wait_for_timeout(1000)
        self.click_contact_now()
