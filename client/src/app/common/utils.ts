import { HEADER_KEYS } from "./constants";

export abstract class Utils {

    static getAuthorizationHeader(newToken: string): string {
        return `${HEADER_KEYS.BEARER_KEY}${newToken}`;
    }

    static isPublicUrl(url: string): boolean {
        const publicEndpoints = ['/login', '/register', '/refresh'];
        const isPublic = publicEndpoints.some(endpoint => url.includes(endpoint));
        console.log('Utils.isPublicUrl check:', url, '-> isPublic:', isPublic);
        return isPublic;
    }

    static getErrorMessage(error: any, context: string = 'данни'): string {
        if (error.status === 401) {
            // Special handling for authentication context
            if (context === 'влизане' || context === 'authentication') {
                return 'Неправилно потребителско име или парола.';
            }
            return `Нямате права за достъп до ${context}.`;
        }
        if (error.status === 400) {
            // For auth context, show more specific message
            if (context === 'влизане' || context === 'authentication') {
                return error.error?.message || 'Невалидни данни.';
            }
            return 'Невалидни данни.';
        }
        if (error.status === 404) {
            return `${context.charAt(0).toUpperCase() + context.slice(1)} не бяха намерени.`;
        }
        if (error.status === 500) {
            // For auth context, show more specific message
            if (context === 'влизане' || context === 'authentication') {
                return 'Вътрешна грешка на сървъра. Моля опитайте по-късно.';
            }
            return 'Проблем със сървъра. Моля, опитайте отново по-късно.';
        }
        if (error.status === 0) {
            return 'Не може да се свърже със сървъра. Моля проверете интернет връзката си.';
        }
        if (!navigator.onLine) {
            return 'Няма интернет връзка. Моля, проверете мрежата си.';
        }

        // Default messages based on context
        if (context === 'влизане' || context === 'authentication') {
            return 'Възникна грешка при влизане. Моля опитайте отново.';
        }
        return `Възникна неочаквана грешка при зареждане на ${context}.`;
    }
}