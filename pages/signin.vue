<template>
    <amplify-authenticator v-bind:authConfig="authConfig" />
</template>

<script>
export default {
    data () {
        return {
            authConfig: {
                signUpConfig: {
                    header: 'アカウント作成',
                    hideAllDefaults: true,
                    defaultCountryCode: '1',
                    signUpFields: [
                        {
                            label: 'ユーザー名',
                            key: 'username',
                            required: true,
                            displayOrder: 1,
                            type: 'string'
                        },
                        {
                            label: 'メールアドレス',
                            key: 'email',
                            required: true,
                            displayOrder: 2,
                            type: 'string'
                        },
                        {
                            label: 'Password',
                            key: 'password',
                            required: true,
                            displayOrder: 3,
                            type: 'password'
                        }
                    ]
                }
            }
        }
    }
}
</script>