'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { AnalyzeResponse } from '../../types/api';
import AuditDocument from './AuditDocument';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface DownloadButtonProps {
    data: AnalyzeResponse;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data }) => {
    const [isClient, setIsClient] = useState(false);
    const { user } = useAuth(); // Retrieve user for branding

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

    const canExport = user?.plan_tier === "pro" || user?.plan_tier === "agency";

    if (!canExport) {
        return (
            <Button
                variant="outline"
                className="w-full sm:w-auto border border-zinc-700 bg-zinc-800/50 text-zinc-400 cursor-not-allowed hover:bg-zinc-800"
                onClick={() => window.location.href = '/pricing'}
            >
                <div className="flex items-center gap-2">
                    <FileDown className="h-4 w-4" />
                    <span>PDF Export (Pro only)</span>
                </div>
            </Button>
        )
    }

    return (
        <PDFDownloadLink
            document={
                <AuditDocument
                    data={data}
                    brandColor={user?.brand_color}
                    agencyName={user?.agency_name}
                    logoUrl={user?.logo_url}
                />
            }
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
