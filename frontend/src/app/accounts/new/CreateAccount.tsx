"use server";
import { redirect, RedirectType } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createNewAccount, loginResponse } from '@/services/apis';
import { cookies } from 'next/headers';

type FormState = {
    message: string;
    errors?: {
        username?: string[];
        password?: string[];
        confirmPassword?: string[];
    };
    success?: boolean;
};

export async function createAccount(prevState: FormState, formData: FormData): Promise<FormState> {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const errors: FormState['errors'] = {};

    if (!username || username.trim() === '') {
        errors.username = ['Username is required'];
    }

    if (!password || password.trim() === '') {
        errors.password = ['Password is required'];
    } else if (password.length < 8) {
        errors.password = ['Password must be at least 8 characters'];
    }

    if (password !== confirmPassword) {
        errors.confirmPassword = ['Passwords do not match'];
    }

    if (Object.keys(errors).length > 0) {
        return {
            message: '',
            errors,
            success: false
        };
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    const response: loginResponse = await createNewAccount({ username, password }, token);

    if (!response.success) {
        return {
            message: response.message,
            success: false
        };
    }

    revalidatePath('/accounts');
    redirect('/accounts', RedirectType.replace);
}
