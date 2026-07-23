export default function PageLoading() {
    return (
        <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-white/40 text-sm">
                <span className="w-4 h-4 border-2 border-white/20 border-t-[#2EDB8F] rounded-full animate-spin" />
                Loading...
            </div>
        </div>
    )
}
