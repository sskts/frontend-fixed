declare namespace Express {
    export interface Request {
       form?: Form;
    }

    export interface Form {
        errors: Array<any>;
        getErrors(): Object;
        getErrors(name: string): Array<any>;
        isValid: boolean;
        flashErrors(): Object;
        flashErrors(name: string): any;
    }

    // export interface Form2 {
    //     [key: string]: string;
    // }
}

declare module "express-form" {
    import express = require('express');

    function form(...args: any[]): express.RequestHandler;

    namespace form {
        export function field(property?: string, label?: string): Field;
        export function configure(options: any): any;

        export interface Field {
            (property?: string, label?: string): Field;
            array(): Field;
            arrLength(from: number, to: number): Field;
            custom(func: Function): Field;
            custom(func: Function, message?: string): Field;
            ifNull(replacement: any): Field;
            truncate(length: number): Field;
            contains(test: any, message?: string): Field;
            notContains(test: any, message?: string): Field;
            equals(other: any, message?: string): Field;
            regex(pattern: RegExp, message: string): Field;
            notRegex(message?: string): Field;
            required(placeholderValue?: string, message?: string): Field;
            minLength(length: number, message?: string): Field;
            maxLength(length: number, message?: string): Field;

            entityDecode(): Field;
            entityEncode(): Field;
            ltrim(chars?: any): Field;
            rtrim(chars?: any): Field;
            trim(chars?: any): Field;
            escape(func: Function, message?: string): Field;

            toFloat(): Field;
            toInt(): Field;
            toBoolean(): Field;
            toBooleanStrict(): Field;
            toUpper(): Field;
            toLower(): Field;

            isNumeric(message?: string): Field;
            isInt(message?: string): Field;
            isDecimal(message?: string): Field;
            isFloat(message?: string): Field;
            isDate(message?: string): Field;
            isEmail(message?: string): Field;
            isString(message?: string): Field;
            isUrl(message?: string): Field;
            isIP(message?: string): Field;
            isAlpha(message?: string): Field;
            isAlphanumeric(message?: string): Field;
            isLowercase(message?: string): Field;
            isUppercase(message?: string): Field;
        }
    }

    export = form;
}