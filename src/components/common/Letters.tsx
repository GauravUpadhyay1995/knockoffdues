import { useState, useEffect } from "react";
import Modal from "@/components/common/Modal";
import JoiningLetter from "@/components/letters/JoiningLetter";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import { useUserData } from "@/hooks/useUserData";
import { FiMail, FiDelete, FiEye, FiDownload, FiRepeat } from "react-icons/fi";

// ✅ Reusable IconButton component
const IconButton = ({ Icon, title, onClick, color = "gray" }) => (
    <Icon
        title={title}
        onClick={onClick}
        className={`h-6 w-6 cursor-pointer text-${color}-700 dark:text-${color}-400 rounded-lg hover:scale-110 transition-transform`}
    />
);

// ✅ Letter list component
const LetterList = ({
    lettersList,
    userData,
    handleDownload,
    handlePreview,
    handleDelete,
    handleSendMail,
}) => {
    if (!lettersList?.length) return null;

    return (
        <div className="mt-8 space-y-4">
            {lettersList.map((letter, index) => {
                const Icon = letter.isSent ? FiRepeat : FiMail;

                return (
                    <div
                        key={letter._id || index}
                        className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
                    >
                        {/* --- Left: Letter Info --- */}
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                                <span className="text-orange-600 dark:text-orange-400 text-sm font-medium">
                                    {letter.letterType?.[0]?.toUpperCase() || "L"}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                                    {letter.letterType} Letter
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Issued on {new Date(letter.issueDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* --- Right: Action Icons --- */}
                        <div className="flex items-center space-x-2">
                            <IconButton
                                Icon={FiDownload}
                                title="Download"
                                onClick={() => handleDownload(letter.url)}
                                color="orange"
                            />
                            <IconButton
                                Icon={FiEye}
                                title="Preview"
                                onClick={() => handlePreview(letter.letterType, userData)}
                                color="orange"
                            />
                            {!letter.isSent && (
                                <IconButton
                                    Icon={FiDelete}
                                    title="Delete"
                                    onClick={() => handleDelete(letter._id)}
                                    color="red"
                                />
                            )}
                            <IconButton
                                Icon={Icon}
                                title={letter.isSent ? "Re send Mail" : "Send Mail"}
                                onClick={() => handleSendMail(letter)}
                                color="green"
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const LettersManagement = ({ userData }) => {
    const { user, refresh, isLoading: userLoading } = useUserData(userData._id);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [currentPreview, setCurrentPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState({});
    const [lettersList, setLettersList] = useState([]);

    // 🔁 Auto-sync letters whenever user changes
    useEffect(() => {
        const letters = Array.isArray(user?.letters) ? user.letters : [];
        setLettersList(letters);
    }, [user]);

    // 🧾 Generate Letter
    const handleGeneratePDF = async (letterType, data = {}) => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/letters`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ letterType, userData: data }),
            });

            const result = await response.json();
            if (result?.success) {
                toast.success("Letter generated successfully!");
                setTimeout(() => refresh(), 600);
            } else {
                toast.error(result?.message || "Failed to generate letter");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to generate letter");
        } finally {
            setLoading(false);
        }
    };

    // 🔍 Preview Letter
    const handlePreview = (letterType, data = {}) => {
        setCurrentPreview(letterType);
        setPreviewData(data);
        setIsPreviewOpen(true);
    };
    const handleClosePreview = () => {
        setIsPreviewOpen(false);
        setCurrentPreview(null);
        setPreviewData({});
    };

    // 📥 Download
    const handleDownload = (url) => {
        if (!url) return toast.error("etterink not available");
        const link = document.createElement("a");
        link.href = url;
        link.download = url.split("/").pop();
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 🗑️ Delete Letter
    const handleDelete = async (letterId) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete the letter.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
        });

        if (confirm.isConfirmed) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/letters/${letterId}`, {
                    method: "DELETE",
                });
                const result = await response.json();

                if (result.success) {
                    toast.success("Letter deleted successfully!");
                    refresh();
                } else {
                    toast.error(result.message || "Failed to delete letter");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error deleting letter");
            }
        }
    };

    // 📧 Send Mail
    const handleSendMail = async (letter) => {
        const confirm = await Swal.fire({
            title: "Send this letter by email?",
            text: `Letter type: ${letter.letterType}`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#16a34a",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, send it!",
        });

        if (confirm.isConfirmed) {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/letters/send`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userData, letter }),
                });

                const result = await response.json();
                if (result.success) {
                    refresh();
                    toast.success("Mail sent successfully!");
                } else {
                    toast.error(result.message || "Failed to send mail");
                }
            } catch (error) {
                console.error(error);
                toast.error("Error sending mail");
            }
        }
    };

    // 🪶 Render Preview
    const renderPreviewContent = () => {
        switch (currentPreview) {
            case "joining":
                return <JoiningLetter employeeData={previewData} />;
            default:
                return <div>No preview available</div>;
        }
    };

    const getPreviewTitle = () => {
        switch (currentPreview) {
            case "joining":
                return "Joining Letter Preview";
            default:
                return "Letter Preview";
        }
    };
    const LettersSkeleton = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 w-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-3 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="flex space-x-2">
                        <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                        <div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                </div>
            ))}
        </div>
    );
    if (userLoading || !user) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Loading Letters...
                </h2>
                <LettersSkeleton />
            </div>
        );
    }
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {lettersList.length === 0 ? "Letters Management" : "Recently Generated Letters"}
            </h2>

            {/* Letter Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {!lettersList.some((l) => l.letterType === "joining") && (
                    <LetterCard
                        title="Joining Letter"
                        description="Official joining confirmation letter"
                        loading={loading}
                        onGenerate={() => handleGeneratePDF("joining", userData)}
                        onPreview={() => handlePreview("joining", userData)}
                    />
                )}
                {!lettersList.some((l) => l.letterType === "experience") && (
                    <LetterCard
                        title="Experience Letter"
                        description="Official experience letter"
                        loading={loading}
                        onGenerate={() => handleGeneratePDF("experience", userData)}
                        onPreview={() => handlePreview("experience", userData)}
                    />
                )}
            </div>

            {/* Generated Letters */}
            <LetterList
                lettersList={lettersList}
                userData={userData}
                handleDownload={handleDownload}
                handlePreview={handlePreview}
                handleDelete={handleDelete}
                handleSendMail={handleSendMail}
            />

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onClose={handleClosePreview} title={getPreviewTitle()}>
                {renderPreviewContent()}
            </Modal>
        </div>
    );
};

// 🔹 Reusable letter template card
const LetterCard = ({ title, description, onGenerate, onPreview, loading }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                Active
            </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        <div className="flex space-x-2">
            <button
                type="button"
                className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                onClick={onGenerate}
            >
                {loading ? "Please Wait..." : "Generate"}
            </button>
            <button
                type="button"
                onClick={onPreview}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                Preview
            </button>
        </div>
    </div>
);

export default LettersManagement;
