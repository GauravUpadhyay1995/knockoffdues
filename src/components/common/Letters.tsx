import { useState } from 'react';
import Modal from '@/components/common/Modal';
import JoiningLetter from '@/components/letters/JoiningLetter';
import OfferLetter from '@/components/letters/OfferLetter';
import AppraisalLetter from '@/components/letters/AppraisalLetter'; // Create similar component

const LettersManagement = ({ user, department }) => {
    user.department = department;

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [currentPreview, setCurrentPreview] = useState(null);
    const [previewData, setPreviewData] = useState({});

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

    const renderPreviewContent = () => {
        console.log("previewData in letters", previewData);
        switch (currentPreview) {

            case 'joining':
                return <JoiningLetter employeeData={previewData} />;
            case 'offer':
                return <OfferLetter employeeData={previewData} />;
            case 'appraisal':
                return <AppraisalLetter employeeData={previewData} />;
            default:
                return <div>No preview available</div>;
        }
    };
    

    const getPreviewTitle = () => {
        switch (currentPreview) {
            case 'joining':
                return 'Joining Letter Preview';
            case 'offer':
                return 'Offer Letter Preview';
            case 'appraisal':
                return 'Appriasal Certificate Preview';
            default:
                return 'Letter Preview';
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Letters Management
            </h2>

            {/* Dummy Letters Content */}
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Letter Template 1 */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Joining Letter
                            </h3>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                Active
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Official joining confirmation letter
                        </p>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Generate
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePreview('joining', user)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Preview
                            </button>
                        </div>
                    </div>

                    {/* Letter Template 2 */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Offer Letter
                            </h3>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                                Active
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Offer of Employment Letter
                        </p>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Generate
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePreview('offer', user)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Preview
                            </button>
                        </div>
                    </div>

                    {/* Letter Template 3 */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Appraisal Letter
                            </h3>
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">
                                Draft
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Appraisal details
                        </p>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                className="flex-1 px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                            >
                                Generate
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePreview('appraisal', user)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Preview
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Generated Letters */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Recently Generated Letters
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <div className="space-y-3">
                            {/* Recent letters list */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <Modal
                isOpen={isPreviewOpen}
                onClose={handleClosePreview}
                title={getPreviewTitle()}
            >
                {renderPreviewContent()}
            </Modal>
        </div>
    );
};

export default LettersManagement;