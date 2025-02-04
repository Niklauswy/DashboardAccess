import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const NoData = () => {
    return (
        <div className="p-6 flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md bg-white shadow-lg rounded-lg flex flex-col items-center p-6 animate-fade-in">
                <CardContent className="text-center py-10">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Sin datos disponibles</h2>
                    <p className="text-gray-500">No se encontraron datos para mostrar.</p>
                </CardContent>
            </Card>
        </div>
    );
};

export default NoData;
