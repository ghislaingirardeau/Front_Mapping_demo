export default function ({ store, redirect, fire }) {
    if (!store.state.userAuth) {
        return redirect('/')
    }
}