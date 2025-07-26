
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SiteConfig } from "@shared/schema";

interface AboutSectionTextsFormProps {
  configs: SiteConfig[];
}

export function AboutSectionTextsForm({ configs }: AboutSectionTextsFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const aboutSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    professionalTitle: z.string().min(1, "Título profissional é obrigatório"),
    description: z.string().min(1, "Descrição é obrigatória"),
  });

  type AboutTextsForm = z.infer<typeof aboutSchema>;

  const getAboutData = () => {
    const aboutSection = configs?.find(c => c.key === 'about_section')?.value as any || {};
    const generalInfo = configs?.find(c => c.key === 'general_info')?.value as any || {};
    const professionalTitleInfo = configs?.find(c => c.key === 'professional_title')?.value as any || {};
    
    return {
      name: generalInfo.name || "Dra. (Adrielle Benhossi)",
      professionalTitle: professionalTitleInfo.title || generalInfo.professionalTitle || "Psicóloga Clínica",
      description: aboutSection.description || "Com experiência em terapia cognitivo-comportamental, ofereço um espaço seguro e acolhedor para você trabalhar suas questões emocionais e desenvolver ferramentas para uma vida mais equilibrada.",
    };
  };

  const form = useForm<AboutTextsForm>({
    resolver: zodResolver(aboutSchema),
    defaultValues: getAboutData(),
  });

  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const newData = getAboutData();
      form.reset(newData);
    }
  }, [configs, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: AboutTextsForm) => {
      // Atualizar nome na configuração geral
      await apiRequest("POST", "/api/admin/config", {
        key: "general_info",
        value: { 
          name: data.name
        }
      });
      
      // Atualizar título profissional separadamente
      await apiRequest("POST", "/api/admin/config", {
        key: "professional_title",
        value: { 
          title: data.professionalTitle 
        }
      });
      
      // Atualizar descrição na seção sobre
      await apiRequest("POST", "/api/admin/config", {
        key: "about_section",
        value: { description: data.description }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/config"] });
      toast({ title: "Textos da seção Sobre atualizados com sucesso!" });
    },
  });

  const onSubmit = (data: AboutTextsForm) => {
    updateMutation.mutate(data);
  };

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Psicóloga</FormLabel>
                <FormControl>
                  <Input placeholder="Dra. (Adrielle Benhossi)" {...field} />
                </FormControl>
                <FormDescription>
                  Nome que aparece na seção sobre. Use parênteses para aplicar gradiente: Ex: "Dra. (Adrielle Benhossi)"
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="professionalTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título Profissional</FormLabel>
                <FormControl>
                  <Input placeholder="Psicóloga Clínica CRP 08/123456" {...field} />
                </FormControl>
                <FormDescription>
                  Título profissional que aparece abaixo do nome na seção sobre
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição Principal</FormLabel>
                <FormControl>
                  <Textarea placeholder="Com experiência em terapia cognitivo-comportamental..." rows={4} {...field} />
                </FormControl>
                <FormDescription>
                  Descrição detalhada sobre sua experiência e abordagem profissional
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar Textos da Seção Sobre"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
