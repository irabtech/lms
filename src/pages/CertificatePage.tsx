import { useParams, Link } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Award, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const CertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const { getCertificate, isLoading } = useCourses();

  const certificate = getCertificate(id || '');

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Certificate not found</h1>
          <Button asChild><Link to="/certificates">View All Certificates</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 no-print print:hidden">
          <Link to="/certificates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 md:mb-0">
            <ArrowLeft className="h-4 w-4" /> Back to Certificates
          </Link>
          <Button onClick={handlePrint} className="gradient-primary">
            <Download className="h-4 w-4 mr-2" /> Print / Download PDF
          </Button>
        </div>

        {/* Certificate Container */}
        <div className="relative bg-white shadow-2xl mx-auto overflow-hidden print:shadow-none print:m-0"
          style={{
            width: '100%',
            aspectRatio: '1.414/1',
            maxWidth: '850px',
            border: '20px solid transparent',
            borderImage: 'linear-gradient(to bottom right, #C5A059, #F1D299, #C5A059) 1'
          }}>

          {/* Internal Border */}
          <div className="h-full w-full border-4 border-[#C5A059]/30 p-1 relative z-10">
            <div className="h-full w-full bg-[#fdfaf5] p-12 flex flex-col items-center justify-between text-center relative">

              {/* Background Decoration */}
              <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center overflow-hidden">
                <Award className="w-[60%] h-[60%] text-[#C5A059]" />
              </div>

              {/* Header */}
              <div className="w-full">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <span className="text-xl font-display font-bold tracking-widest text-[#C5A059] uppercase">IRAB Tech Learning Hub</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-[2px] w-20 bg-[#C5A059]/40"></div>
                  <h1 className="text-5xl font-display font-bold text-gray-900 tracking-tight">CERTIFICATE</h1>
                  <div className="h-[2px] w-20 bg-[#C5A059]/40"></div>
                </div>
                <p className="text-lg font-medium tracking-[0.3em] text-gray-500 uppercase mb-8">OF COMPLETION</p>
              </div>

              {/* Recipient Section */}
              <div className="w-full">
                <p className="text-gray-600 italic font-serif text-xl mb-6">This certificate is proudly presented to</p>
                <h2 className="text-6xl font-display font-extrabold text-[#C5A059] mb-4 drop-shadow-sm">{certificate.studentName}</h2>
                <div className="w-2/3 h-[1px] bg-gray-300 mx-auto mb-6"></div>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  for successfully completing all requirements and passing the assessments for the official online course:
                </p>
                <h3 className="text-3xl font-display font-bold text-gray-900 mt-6 italic">"{certificate.courseName}"</h3>
              </div>

              {/* Footer Section */}
              <div className="w-full pt-8 px-8">
                <div className="grid grid-cols-3 gap-12 items-end">
                  {/* Date */}
                  <div className="text-center">
                    <div className="border-b border-gray-400 pb-1 mb-2">
                      <span className="font-serif italic text-lg">{new Date(certificate.completedAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Issue Date</p>
                  </div>

                  {/* Seal */}
                  <div className="flex flex-col items-center justify-center relative">
                    <div className="w-24 h-24 rounded-full border-4 border-[#C5A059] bg-[#C5A059]/10 flex items-center justify-center relative">
                      <Award className="h-12 w-12 text-[#C5A059]" />
                      <div className="absolute inset-0 border-2 border-dashed border-[#C5A059]/30 rounded-full animate-spin-slow"></div>
                    </div>
                    <p className="mt-2 text-[10px] uppercase font-bold text-[#C5A059]">Certified Authentic</p>
                  </div>

                  {/* Signature */}
                  <div className="text-center">
                    <div className="border-b border-gray-400 pb-1 mb-2">
                      <span className="font-serif italic text-lg text-gray-800">{certificate.instructorName}</span>
                    </div>
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Instructor Signature</p>
                  </div>
                </div>
              </div>

              {/* Awarded By */}
              <div className="mt-12 text-center">
                <p className="text-sm font-medium text-gray-500 tracking-wide">
                  Awarded by <span className="text-[#C5A059] font-bold">IRAB Technologies</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-2 font-mono">
                  VERIFICATION ID: {certificate.id.toUpperCase()}
                </p>
              </div>

              {/* Corner Ornaments */}
              <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-[#C5A059]/40 opacity-50"></div>
              <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-[#C5A059]/40 opacity-50"></div>
              <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-[#C5A059]/40 opacity-50"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-[#C5A059]/40 opacity-50"></div>
            </div>
          </div>
        </div>

        {/* Action Button for mobile/tablet */}
        <div className="mt-8 flex justify-center print:hidden">
          <Button onClick={handlePrint} variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/5">
            <Download className="h-5 w-5 mr-2" /> Save as PDF
          </Button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
            body * {
                visibility: hidden;
            }
            .no-print {
                display: none !important;
            }
            .container {
                max-width: 100% !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            main {
                margin: 0 !important;
                padding: 0 !important;
            }
            nav {
                display: none !important;
            }
            .print\\:hidden {
                display: none !important;
            }
            /* Show only the certificate */
            .relative.bg-white {
                visibility: visible;
                position: fixed;
                left: 0;
                top: 0;
                width: 297mm; /* A4 Landscape width */
                height: 210mm; /* A4 Landscape height */
                border: 0 !important;
                padding: 0 !important;
                margin: 0 !important;
                box-shadow: none !important;
            }
            .relative.bg-white * {
                visibility: visible;
            }
        }
        @page {
            size: landscape;
            margin: 0;
        }
      `}} />
    </div>
  );
};

export default CertificatePage;
