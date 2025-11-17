import { useEffect} from "react"

declare global {
    interface Window {
        frameworkReady?: () => void;
    }
}

export function userFrameworkReady() {
    useEffect(() => {
        window.frameworkReady?.()
    })
}