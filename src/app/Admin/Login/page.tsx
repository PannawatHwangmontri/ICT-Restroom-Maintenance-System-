export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

                <h1 className="text-2xl font-semibold text-center">
                    UP Office
                </h1>

                <p className="mt-2 text-center text-gray-500">
                    ระบบจัดการภายในมหาวิทยาลัย
                </p>

                <button
                    className="mt-8 w-full rounded-lg bg-blue-600 py-3 text-white"
                >
                    Login with UP Account
                </button>

            </div>

        </main>
    );
}