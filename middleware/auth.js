import { Auth } from 'aws-amplify'

export default async ({ redirect }) => {
    const userInfo = await Auth.currentUserInfo()

    if (!userInfo) {
      redirect('/signin')
    }
}