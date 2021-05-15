import auth from '@react-native-firebase/auth';

export async function getToken() {
    const user = await auth().currentUser
    if (user) {
        const token = await user.getIdToken()
        return token
    }
}

// export async function confirmCode(verificationId, code) {
//     try {
//         const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code)
//         const result = await firebase.auth().signInWithCredential(credential)
//         return result
//     } catch (error) {
//         throw error
//     }
// }

// export async function fileUpload(data) {
//     try {
//         const response = await fetch(data.uri)
//         const blob = await response.blob()
//         const root = firebase.storage().ref()
//         const storageRef = root.child(`${data.path}/${data.name}`)
//         const snapshot = await storageRef.put(blob);
//         blob.close()
//         const dt = await snapshot.ref.getDownloadURL()
//         return {status: true, data: dt } 
//     } catch (error){
//         return {status: false, data: error}
//     }
    
// }


export async function logout() {
    try {
        await auth().signOut()
        return
    } catch (error) {
        throw error
    }
}