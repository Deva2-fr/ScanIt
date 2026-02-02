'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AnalyzeResponse } from '../../types/api';
import AuditDocument from './AuditDocument';
import { Button } from '../ui/button';
import { FileDown, Loader2 } from 'lucide-react';

interface DownloadButtonProps {
    data: AnalyzeResponse;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data }) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <Button disabled variant="outline">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Préparation...
            </Button>
        );
    }

    const fileName = `audit_${data.url.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;

    return (
        <PDFDownloadLink
            document={<AuditDocument data={data} />}
            fileName={fileName}
            style={{ textDecoration: 'none' }}
        >
            {({ blob, url, loading, error }) => (
                <Button
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white border-0 transition-all shadow-lg hover:shadow-violet-500/25"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Préparation du document...
                        </>
                    ) : (
                        <>
                            <FileDown className="mr-2 h-4 w-4" />
                            Télécharger le Rapport (PDF)
                        </>
                    )}
                </Button>
            )}
        </PDFDownloadLink>
    );
};

export default DownloadButton;
