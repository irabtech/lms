import { useParams, Link } from 'react-router-dom';
import { useCourses } from '@/contexts/CourseContext';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Download, Award, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const CertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const { getCertificate } = useCourses();

  const certificate = getCertificate(id || '');

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

  const handleDownload = () => {
    toast.success('Certificate download started! (Demo)');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-4xl">
        <Link to="/certificates" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Certificates
        </Link>

        <div className="flex justify-end mb-4">
          <Button onClick={handleDownload}><Download className="h-4 w-4" /> Download Certificate</Button>
        </div>

        {/* Certificate Preview */}
        <Card className="shadow-xl border-4 border-primary/20 overflow-hidden animate-fade-in">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-primary/5 via-white to-accent/5 p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center gap-3 mb-4">
                  <div className="gradient-primary rounded-xl p-3">
                    <Award className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <span className="text-3xl font-display font-bold text-primary">LearnHub</span>
                </div>
                <h1 className="text-4xl font-display font-bold text-foreground mb-2">Certificate of Completion</h1>
                <div className="w-32 h-1 bg-primary mx-auto rounded-full" />
              </div>

              {/* Body */}
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground mb-4">This is to certify that</p>
                <h2 className="text-4xl font-display font-bold text-primary mb-4">{certificate.studentName}</h2>
                <p className="text-lg text-muted-foreground mb-4">has successfully completed the course</p>
                <h3 className="text-2xl font-display font-semibold mb-6">"{certificate.courseName}"</h3>

                <div className="flex items-center justify-center gap-2 text-success mb-8">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">Course Completed with Distinction</span>
                </div>
              </div>

              {/* Footer */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-primary/20">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Date Issued</p>
                  <p className="font-semibold">{new Date(certificate.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Instructor</p>
                  <p className="font-semibold">{certificate.instructorName}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Certificate ID</p>
                  <p className="font-mono text-sm">{certificate.id.toUpperCase()}</p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-br-full" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-accent/5 rounded-tl-full" />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" asChild>
            <Link to={`/course/${certificate.courseId}`}>View Course</Link>
          </Button>
          <Button onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button>
        </div>
      </div>
    </div>
  );
};

export default CertificatePage;
