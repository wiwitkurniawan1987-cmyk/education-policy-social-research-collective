(function () {
  const storageKey = "epsr-forum-content";
  const authKey = "epsr-forum-admin-session";
  const passwordKey = "epsr-forum-admin-password";

  const defaults = {
    updatedAt: "2026-09-13",
    site: {
      title: "Education Policy and Social Research Forum",
      location: "Bloomington, USA",
      kicker: "Bloomington student research forum",
      heroTitle: "Education Policy and Social Research Forum",
      heroLead:
        "A student-led community in Bloomington for people interested in education policy, social research, public ideas, and careful conversation.",
      primaryAction: "About the forum",
      secondaryAction: "Discussion topics",
      email: "hello@eposrforum.study",
      footerNote:
        "Student community forum in Bloomington, USA. No official institutional, nonprofit, corporate, or financial function.",
    },
    profile: {
      kicker: "Profile",
      title: "A quiet forum for students who want to think carefully together.",
      paragraphs: [
        "Education Policy and Social Research Forum is a student community and casual academic forum in Bloomington, USA. It exists as a space to learn, read, discuss, and exchange thoughtful feedback among students interested in education policy and social research.",
        "The forum is an unincorporated student forum and is not affiliated with or representative of any institution. It is not a registered nonprofit organisation, corporation, or legal entity, and it does not conduct financial activity. Its main activities are casual academic conversations, reading groups, methods discussions, and sharing working ideas.",
      ],
      noteTitle: "Bloomington setting",
      noteBody:
        "We borrow the town's slower academic rhythm: walkable conversations, library notes, limestone buildings, autumn light, and research questions that mature through dialogue.",
    },
    focusAreas: [
      {
        label: "Education policy",
        text: "School governance, learning equity, teacher policy, accountability, and public education reform.",
      },
      {
        label: "Social research",
        text: "Qualitative inquiry, survey thinking, community context, social mobility, and research ethics.",
      },
      {
        label: "Comparative learning",
        text: "Indonesia, the United States, and broader conversations on education systems and inequality.",
      },
    ],
    research: {
      kicker: "Research",
      title: "Questions we gather around.",
      intro:
        "These topics are not framed as an official program. They are areas of shared interest that often become material for reading, discussion, and shared reflection.",
      posts: [
        {
          title: "Education policy and equity",
          summary:
            "Access, school choice, funding, accountability, and how policy affects unequal learning conditions.",
        },
        {
          title: "Social research methods",
          summary:
            "Qualitative fieldwork, survey design, interviews, causal inference, and ethical research practice.",
        },
        {
          title: "Indonesia and comparative education",
          summary:
            "Education debates in Indonesia read alongside broader global and local policy conversations.",
        },
        {
          title: "Public writing and peer feedback",
          summary:
            "Drafting essays, research notes, policy memos, and presentations for constructive discussion.",
        },
      ],
    },
    publication: {
      kicker: "Article & Publication",
      title: "Notes, reading lists, and working drafts.",
      intro:
        "Materials listed here are informal community outputs. They are shared for learning and discussion, not as institutional reports or paid products.",
      posts: [
        {
          type: "Reading list",
          title: "Education policy, inequality, and local governance",
          date: "September 2026",
          datetime: "2026-09",
        },
        {
          type: "Discussion note",
          title: "What counts as evidence in education policy debates?",
          date: "August 2026",
          datetime: "2026-08",
        },
        {
          type: "Working draft",
          title: "Thinking comparatively about Indonesian schooling and social mobility",
          date: "July 2026",
          datetime: "2026-07",
        },
      ],
    },
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));

  function loadContent() {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...clone(defaults), ...JSON.parse(saved) } : clone(defaults);
    } catch (error) {
      console.warn("Using default content because saved content could not be read.", error);
      return clone(defaults);
    }
  }

  function saveContent(content) {
    const next = { ...content, updatedAt: new Date().toISOString() };
    localStorage.setItem(storageKey, JSON.stringify(next));
    return next;
  }

  function resetContent() {
    localStorage.removeItem(storageKey);
    return clone(defaults);
  }

  function getPassword() {
    return localStorage.getItem(passwordKey) || "admin123";
  }

  function setPassword(password) {
    localStorage.setItem(passwordKey, password);
  }

  function login(password) {
    if (password !== getPassword()) return false;
    localStorage.setItem(authKey, "active");
    return true;
  }

  function logout() {
    localStorage.removeItem(authKey);
  }

  function isLoggedIn() {
    return localStorage.getItem(authKey) === "active";
  }

  window.EPSRContent = {
    authKey,
    defaults,
    getPassword,
    isLoggedIn,
    loadContent,
    login,
    logout,
    resetContent,
    saveContent,
    setPassword,
    storageKey,
  };
})();
