import { getDefaultersSummaryQuery } from "@/modules/financial/queries/defaulters.queries";
import { formatCurrency, formatPhone, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  Phone,
  Mail,
  MessageCircle,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DefaultersPage() {
  const defaulters = await getDefaultersSummaryQuery();

  const totalOverdue = defaulters.reduce(
    (acc, curr) => acc + curr.totalOverdueAmount,
    0
  );
  const totalInvoices = defaulters.reduce(
    (acc, curr) => acc + curr.overdueInvoicesCount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            Controle de Inadimplência
          </h2>
          <p className="text-sm text-slate-500">
            Monitoramento de alunos com parcelas vencidas, histórico de atraso e contato do responsável legal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Exportar Cobrança (CSV)
          </Button>
        </div>
      </div>

      {/* KPI Cards de Inadimplência */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-rose-200 bg-rose-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
              Total em Atraso (Valor Bruto)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold text-rose-600">
              {formatCurrency(totalOverdue)}
            </div>
            <p className="text-xs text-rose-600/80 mt-1">
              Soma das mensalidades vencidas de alunos ativos
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Alunos com Pendência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {defaulters.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Matrículas ativas com débitos em aberto
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Parcelas Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {totalInvoices}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Média de {defaulters.length ? (totalInvoices / defaulters.length).toFixed(1) : 0} parcelas por inadimplente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Inadimplentes */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Listagem Consolidada de Débitos</CardTitle>
          <CardDescription>
            Ordenado do maior para o menor tempo de atraso (dias corridos desde o vencimento original)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {defaulters.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                ✓
              </div>
              <h3 className="font-semibold text-slate-800">Nenhum débito em aberto!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Todas as mensalidades do cursinho encontram-se em dia ou pagas.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno & Turma</TableHead>
                  <TableHead>Responsável Financeiro</TableHead>
                  <TableHead className="text-center">Parcelas Vencidas</TableHead>
                  <TableHead className="text-right">Total Devido</TableHead>
                  <TableHead className="text-center">Tempo em Atraso</TableHead>
                  <TableHead className="text-center">Primeiro Vencimento</TableHead>
                  <TableHead className="text-right">Ação de Cobrança</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaulters.map((item) => {
                  const whatsappClean = item.guardianPhone?.replace(/\D/g, "");
                  const whatsappUrl = whatsappClean
                    ? `https://wa.me/55${whatsappClean}?text=Olá%20${encodeURIComponent(
                        item.guardianName
                      )},%20entramos%20em%20contato%20do%20Cursinho%20sobre%20a%20mensalidade%20do%20aluno%20${encodeURIComponent(
                        item.studentName
                      )}.`
                    : null;

                  return (
                    <TableRow key={item.studentId}>
                      <TableCell>
                        <p className="font-semibold text-slate-900">{item.studentName}</p>
                        <p className="text-xs text-slate-500">{item.className}</p>
                      </TableCell>

                      <TableCell>
                        <p className="text-sm font-medium text-slate-800">
                          {item.guardianName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          {item.guardianPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {formatPhone(item.guardianPhone)}
                            </span>
                          )}
                          {item.guardianEmail && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {item.guardianEmail}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge variant="destructive" className="font-mono">
                          {item.overdueInvoicesCount} {item.overdueInvoicesCount > 1 ? "faturas" : "fatura"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right font-bold text-rose-600">
                        {formatCurrency(item.totalOverdueAmount)}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant={item.maxDaysOverdue > 30 ? "destructive" : "warning"}
                        >
                          {item.maxDaysOverdue} dias
                        </Badge>
                      </TableCell>

                      <TableCell className="text-center text-xs text-slate-600 font-mono">
                        {formatDate(item.oldestDueDate)}
                      </TableCell>

                      <TableCell className="text-right">
                        {whatsappUrl ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline" className="gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50">
                              <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                              WhatsApp
                            </Button>
                          </a>
                        ) : (
                          <Button size="sm" variant="ghost" disabled className="text-xs">
                            Sem contato
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

