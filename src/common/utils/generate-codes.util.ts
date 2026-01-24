type CodeType = 'otp' | 'alphanumeric';

export const generateCodes = (typeOfCode: CodeType = 'otp', length: number = 6): string => {
    const ALL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const chars: string = typeOfCode === 'otp' ? ALL_CHARS.slice(52) : ALL_CHARS;

    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }

    return code;
};