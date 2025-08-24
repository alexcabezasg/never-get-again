import { readdirSync, statSync } from 'fs';
import { join, extname } from 'path';


export class ClassLoader {
    private static instance: ClassLoader;

    private constructor() {}

    public static getInstance(): ClassLoader {
        if (!ClassLoader.instance) {
            ClassLoader.instance = new ClassLoader();
        }
        return ClassLoader.instance;
    }

    async findClass(className: string): Promise<new () => any> {
        // Start searching from src directory
        try {
            const srcPath = join(process.cwd(), 'src');
            const classModule = await this.searchClassInDirectory(srcPath, className);

            if (!classModule) {
                throw new Error(`Class ${className} not found in the project`);
            }

            return classModule.default;
        } catch (error) {
            console.error(`Error loading class ${className}:`, error);
            return undefined;
        }
    }

    private async searchClassInDirectory(directory: string, className: string): Promise<any> {
        const files = readdirSync(directory);

        for (const file of files) {
            const fullPath = join(directory, file);
            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                // Recursively search in subdirectories
                const result = await this.searchClassInDirectory(fullPath, className);
                if (result) return result;
            } else if (stat.isFile() && extname(file) === '.ts') {
                try {
                    const module = await import(fullPath);
                    if (module.default?.name === className) {
                        return module;
                    }
                } catch (error) {
                    // Skip files that can't be imported
                    continue;
                }
            }
        }

        return null;
    }
}
