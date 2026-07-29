import fs from 'fs';
import path from 'path';

const MOCK_FILE = path.join(process.cwd(), 'server', 'src', 'modules', 'settings', 'mock_theme.json');

function ensureMockFile() {
  try {
    const dir = path.dirname(MOCK_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(MOCK_FILE)) {
      const defaultData = {
        draft: {
          id: "draft-1",
          name: "Default Theme",
          status: "DRAFT",
          isActive: true,
          version: 1,
          settings: {
            colors: {
               primary: "#e11d48",
               secondary: "#f43f5e",
               background: "#ffffff",
               sectionAlt: "#eef4ff",
               cardBg: "#ffffff",
               textPrimary: "#111827",
               textMuted: "#98a2b3",
               border: "#e5e7eb",
               footerBg: "#f5f6f8"
             },
             typography: {
               bodyFont: "Inter",
               headingFont: "Inter",
               baseSize: 14
             }
          },
          pages: [
            {
              id: "page-1",
              pageType: "HOMEPAGE",
              route: "/",
              sections: [
                { id: "s-0", sectionType: 'ICON_CATEGORIES', title: 'Icon Category Slider', position: 0, enabled: true },
                { id: "s-1", sectionType: 'HERO_BANNER', title: 'Hero Banner Slider', position: 1, enabled: true },
                { id: "s-2", sectionType: 'BESTSELLERS', title: 'Bestseller Product Section', position: 2, enabled: true },
                { id: "s-3", sectionType: 'WIDE_BANNER', title: 'Wide Promotional Banner', position: 3, enabled: true },
                { id: "s-4", sectionType: 'NEW_LAUNCHES', title: 'Newly Launched Product Section', position: 4, enabled: true },
                { id: "s-5", sectionType: 'GIFTS_FOR_EVERYONE', title: 'Gifts for Everyone', position: 5, enabled: true },
                { id: "s-6", sectionType: 'OFFERS', title: 'Save More with Offers', position: 6, enabled: true },
                { id: "s-7", sectionType: 'STORIES', title: 'Joyful Gifting Stories', position: 7, enabled: true },
                { id: "s-8", sectionType: 'FEELINGS', title: 'Gifts for Every Feeling', position: 8, enabled: true },
                { id: "s-9", sectionType: 'OCCASIONS', title: 'Gifts for Every Occasion', position: 9, enabled: true },
                { id: "s-10", sectionType: 'HIGHLIGHTS', title: 'Trust/Service Highlights', position: 10, enabled: true }
              ]
            }
          ]
        },
        published: null,
        versions: []
      };
      fs.writeFileSync(MOCK_FILE, JSON.stringify(defaultData, null, 2));
    }
  } catch (e) {
    console.error("Error initializing mock theme file", e);
  }
}

ensureMockFile();

function getMockData() {
  return JSON.parse(fs.readFileSync(MOCK_FILE, 'utf8'));
}

function saveMockData(data: any) {
  fs.writeFileSync(MOCK_FILE, JSON.stringify(data, null, 2));
}

export class AppearanceService {
  public async getDraftTheme() {
    return getMockData().draft;
  }

  public async updateTheme(data: any, userId?: string) {
    const mock = getMockData();
    mock.draft.name = data.name || mock.draft.name;
    saveMockData(mock);
    return mock.draft;
  }

  public async previewTheme() {
    return this.getDraftTheme();
  }

  public async publishTheme(userId?: string) {
    const mock = getMockData();
    const newVersion = mock.draft.version + 1;
    
    mock.published = JSON.parse(JSON.stringify(mock.draft));
    mock.published.status = "PUBLISHED";
    mock.published.version = newVersion;
    
    mock.versions.push({
      id: "v-" + Date.now(),
      themeId: mock.draft.id,
      version: newVersion,
      snapshot: JSON.stringify(mock.draft),
      createdAt: new Date().toISOString()
    });

    mock.draft.version = newVersion;
    saveMockData(mock);
    return mock.published;
  }

  public async getThemeVersions() {
    return getMockData().versions;
  }

  public async restoreThemeVersion(versionId: string, userId?: string) {
    return { success: true, message: "Version restored" };
  }

  public async getGlobalStyles() {
    return getMockData().draft.settings;
  }

  public async updateGlobalStyles(data: any, userId?: string) {
    const mock = getMockData();
    mock.draft.settings = data;
    saveMockData(mock);
    return mock.draft;
  }

  public async getHomepage() {
    const draft = getMockData().draft;
    return draft.pages.find((p: any) => p.pageType === "HOMEPAGE");
  }

  public async updateHomepage(data: any, userId?: string) {
    const mock = getMockData();
    const homepage = mock.draft.pages.find((p: any) => p.pageType === "HOMEPAGE");
    if (homepage) {
      homepage.settings = data.settings;
      saveMockData(mock);
    }
    return homepage;
  }

  public async addHomepageSection(data: any) {
    const mock = getMockData();
    const homepage = mock.draft.pages.find((p: any) => p.pageType === "HOMEPAGE");
    if (!homepage) throw new Error("Homepage not found");

    const newSection = {
      id: "s-" + Date.now(),
      sectionType: data.sectionType,
      title: data.title,
      position: data.position || 0,
      enabled: true,
      settings: data.settings || {}
    };
    homepage.sections.push(newSection);
    saveMockData(mock);
    return newSection;
  }

  public async updateHomepageSection(id: string, data: any) {
    const mock = getMockData();
    const homepage = mock.draft.pages.find((p: any) => p.pageType === "HOMEPAGE");
    if (homepage) {
      const section = homepage.sections.find((s: any) => s.id === id);
      if (section) {
        Object.assign(section, data);
        saveMockData(mock);
        return section;
      }
    }
    throw new Error("Section not found");
  }

  public async deleteHomepageSection(id: string) {
    const mock = getMockData();
    const homepage = mock.draft.pages.find((p: any) => p.pageType === "HOMEPAGE");
    if (homepage) {
      homepage.sections = homepage.sections.filter((s: any) => s.id !== id);
      saveMockData(mock);
    }
    return { success: true };
  }

  public async reorderHomepageSections(sectionIds: string[]) {
    const mock = getMockData();
    const homepage = mock.draft.pages.find((p: any) => p.pageType === "HOMEPAGE");
    if (homepage) {
      homepage.sections.forEach((s: any) => {
        const index = sectionIds.indexOf(s.id);
        if (index !== -1) s.position = index;
      });
      homepage.sections.sort((a: any, b: any) => a.position - b.position);
      saveMockData(mock);
    }
    return { success: true };
  }
}
