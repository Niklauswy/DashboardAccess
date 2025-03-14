'use client'
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import jsPDF from 'jspdf';

export default function ExportButton({ data, columns, filename = 'export' }) {
    const exportToCSV = () => {
        const headers = columns.map(col => col.label);
        const rows = data.map(item =>
            columns.map(col => item[col.key] || '')
        );

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(value => `"${value}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const now = new Date();
        const fecha = now.toLocaleDateString('es-MX', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const hora = now.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Info de la cabecera
        doc.setFontSize(16);
        doc.text('Universidad Autónoma de Baja California', 105, 20, { align: 'center' });        
        doc.setFontSize(14);
        doc.text('Facultad de Ciencias', 105, 30, { align: 'center' });
        doc.setFontSize(10);
        doc.text(`Fecha: ${fecha}`, 15, 45);
        doc.text(`Hora: ${hora}`, 170, 45);
        doc.text(`Total de registros: ${data.length}`, 15, 52); 

        doc.setLineWidth(0.5);
        doc.line(15, 55, 195, 55);

        const headers = columns.map(col => col.label);
        const rows = data.map(item =>
            columns.map(col => item[col.key] || '')
        );

     
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 60,
            styles: { 
                fontSize: 8,
                cellPadding: 2,
            },
            headStyles: { 
                fillColor: [0, 114, 63], // Color #00723F iel manual de identidad de la UABC
                textColor: [255, 255, 255],
                halign: 'center'
            },
            theme: 'grid',
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 'auto' },
            },
        });

        doc.save(`${filename}.pdf`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-dashed">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 7l-5 5m0 0l5 5m-5-5h12m-7-5v10" />
                    </svg>
                    Exportar
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onSelect={exportToCSV}>
                    Exportar como CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={exportToPDF}>
                    Exportar como PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}