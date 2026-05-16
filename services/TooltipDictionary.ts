
export interface JargonEntry {
    term: string;
    translation: string;
    description: string;
    category: 'security' | 'infrastructure' | 'code' | 'data';
}

export const TOOLTIP_DICTIONARY: Record<string, JargonEntry> = {
    'process.env.API_KEY': {
        term: 'process.env.API_KEY',
        translation: 'App Password (kept hidden)',
        description: 'A way to store secret passwords securely so they don\'t show up in your app\'s public code.',
        category: 'security'
    },
    'API Key': {
        term: 'API Key',
        translation: 'Service Password',
        description: 'A special password that lets your app talk to other services like Gemini or Google Maps.',
        category: 'security'
    },
    'Token': {
        term: 'Token',
        translation: 'Digital Handshake',
        description: 'A unique code used to prove who you are when talking to a server.',
        category: 'security'
    },
    '.env': {
        term: '.env',
        translation: 'Vault File',
        description: 'A hidden file where your app stores its most sensitive secrets and passwords.',
        category: 'security'
    },
    'Repository': {
        term: 'Repository',
        translation: 'Project Folder',
        description: 'The place where all your code and project files are stored and tracked.',
        category: 'infrastructure'
    },
    'Deployment': {
        term: 'Deployment',
        translation: 'Going Live',
        description: 'The process of putting your app on the internet so others can visit it.',
        category: 'infrastructure'
    },
    'Localhost': {
        term: 'Localhost',
        translation: 'Your Own Computer',
        description: 'A special name that refers to the computer you are currently working on.',
        category: 'infrastructure'
    },
    'npm': {
        term: 'npm',
        translation: 'App Toolbox',
        description: 'A collection of tools and mini-apps that you can add to your own project.',
        category: 'infrastructure'
    },
    'CSS': {
        term: 'CSS',
        translation: 'Styling & Design',
        description: 'The instructions that tell the browser how your app should look (colors, fonts, layout).',
        category: 'code'
    },
    'HTML': {
        term: 'HTML',
        translation: 'App Structure',
        description: 'The skeleton of your webpage that defines what content goes where.',
        category: 'code'
    },
    'JSON': {
        term: 'JSON',
        translation: 'Data Package',
        description: 'A standard way to organize and send information between different parts of an app.',
        category: 'data'
    },
    'LocalStorage': {
        term: 'LocalStorage',
        translation: 'Browser Memory',
        description: 'A small chunk of memory in your web browser that remembers things even after you close the page.',
        category: 'data'
    },
    'Callback': {
        term: 'Callback',
        translation: 'Instruction for Later',
        description: 'A part of code that waits for something to finish before starting its own job.',
        category: 'code'
    },
    'Async/Await': {
        term: 'Async/Await',
        translation: 'Wait for Task',
        description: 'Tells the app to pause and wait for a task (like loading a picture) to finish before moving on.',
        category: 'code'
    },
    'Backend': {
        term: 'Backend',
        translation: 'Engine Room',
        description: 'The hidden parts of an app that handle the heavy lifting, like databases and complex calculations.',
        category: 'infrastructure'
    },
    'Environment Variables': {
        term: 'Environment Variables',
        translation: 'App Knobs & Secrets',
        description: 'Settings and passwords that change how the app works without changing the actual code.',
        category: 'security'
    },
    'Deployment': {
        term: 'Deployment',
        translation: 'Going Live',
        description: 'The process of putting your app on the internet so others can visit it.',
        category: 'infrastructure'
    },
    'Production': {
        term: 'Production',
        translation: 'The Real App',
        description: 'The version of your app that actual users see, as opposed to the one you are building.',
        category: 'infrastructure'
    },
    'Build': {
        term: 'Build',
        translation: 'Packaging',
        description: 'Cleaning up and organizing your code so it is ready for the internet.',
        category: 'infrastructure'
    },
    'CI/CD': {
        term: 'CI/CD',
        translation: 'Automated Updates',
        description: 'A system that automatically updates your live app whenever you change your code.',
        category: 'infrastructure'
    },
    'Git Push': {
        term: 'Git Push',
        translation: 'Save to Cloud Folder',
        description: 'Sending your code changes to a secure online storage like GitHub.',
        category: 'infrastructure'
    },
    'Commit': {
        term: 'Commit',
        translation: 'App Snapshot',
        description: 'Saving a permanent description of what you changed in your code at a specific time.',
        category: 'code'
    },
    'Branch': {
        term: 'Branch',
        translation: 'Experiment Path',
        description: 'A separate version of your code where you can try new ideas without breaking the main app.',
        category: 'code'
    }
};

export const translateJargon = (text: string): string => {
    let translated = text;
    Object.keys(TOOLTIP_DICTIONARY).forEach(term => {
        const entry = TOOLTIP_DICTIONARY[term];
        const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        translated = translated.replace(regex, `${entry.translation} (${term})`);
    });
    return translated;
};
