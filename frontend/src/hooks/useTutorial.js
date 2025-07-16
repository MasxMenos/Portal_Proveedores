// src/hooks/useTutorial.js
import { useCallback } from "react";
import Shepherd from "shepherd.js";
import "shepherd.js/dist/css/shepherd.css";
import { useTheme } from "../components/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function useTutorial() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Clase común para botones según tema
  const btnStyle =
    "px-3 py-1 rounded " +
    (isDark ? "bg-blue-600 text-white" : "bg-blue-700 text-white");

  // Definición de botones reutilizables
  const nextBtn = (tour) => ({
    text: t("buttons.next"),
    action: tour.next,
    classes: btnStyle,
  });
  const skipBtn = (tour) => ({
    text: t("buttons.skip"),
    action: tour.cancel,
    classes: btnStyle,
  });
  const endBtn = (tour) => ({
    text: t("buttons.finish"),
    action: tour.cancel,
    classes: btnStyle,
  });
  const backBtn = (tour, prevId, prevRoute) => ({
    text: t("buttons.back"),
    classes: btnStyle,
    action: () => {
      tour.hide();
      if (prevRoute) {
        navigate(prevRoute);
        setTimeout(() => tour.show(prevId), 100);
      } else {
        tour.show(prevId);
      }
    },
  });
  const skipTo = (tour, stepId) => ({
    text: t("buttons.skip"),
    action: () => tour.show(stepId),
    classes: btnStyle,
  });

  // Construcción del tour
  const buildTour = useCallback(() => {
    const tour = new Shepherd.Tour({
      defaultStepOptions: {
        classes: isDark
          ? "bg-[#111416] text-white"
          : "bg-white text-black",
        scrollTo: true,
      },
      useModalOverlay: true,
    });

    // Paso 1: menú lateral
    tour.addStep({
      id: "sidebar-intro",
      text: t("tutorial.sidebarIntro"),
      attachTo: { element: "aside", on: "right" },
      buttons: [skipTo(tour, "nav-facturas"), nextBtn(tour)],
    });

    // Paso 2: ir a Inicio
    tour.addStep({
      id: "nav-inicio",
      text: t("tutorial.goToHome"),
      attachTo: { element: "a[href='/inicio']", on: "right" },
      buttons: [
        backBtn(tour, "sidebar-intro"),
        skipTo(tour, "nav-facturas"),
        {
          text: t("tutorial.buttons.goToHome"),
          classes: btnStyle,
          action: () => {
            tour.hide();
            navigate("/inicio");
            const waiter = setInterval(() => {
              if (document.querySelector("#inicio-metricas")) {
                clearInterval(waiter);
                tour.next();
              }
            }, 100);
          },
        },
      ],
    });

    // Métodos para generar los pasos de métricas
    const metricKeys = ["visitas", "ventas", "productos", "crecimiento"];
    metricKeys.forEach((key, i) => {
      tour.addStep({
        id: `inicio-metrica-${key}`,
        text: t(`tutorial.${key === "visitas" ? "totalVisits"
          : key === "ventas" ? "totalSales"
          : key === "productos" ? "totalProductsSold"
          : "salesGrowth"}`),
        attachTo: { element: `#${key}`, on: "top" },
        buttons: [
          backBtn(
            tour,
            i === 0 ? "nav-inicio" : `inicio-metrica-${metricKeys[i - 1]}`
          ),
          skipTo(tour, "nav-facturas"),
          nextBtn(tour),
        ],
      });
    });

    // Gráfico de ventas
    tour.addStep({
      id: "inicio-ventas-chart",
      text: t("tutorial.salesChart"),
      attachTo: { element: "#inicio-ventas-chart", on: "top" },
      buttons: [
        backBtn(tour, "inicio-metrica-crecimiento"),
        skipTo(tour, "nav-facturas"),
        nextBtn(tour),
      ],
    });

    // Top productos
    tour.addStep({
      id: "inicio-ventas-top",
      text: t("tutorial.topProducts"),
      attachTo: { element: "#inicio-ventas-top", on: "top" },
      buttons: [
        backBtn(tour, "inicio-ventas-chart"),
        skipTo(tour, "nav-facturas"),
        nextBtn(tour),
      ],
    });

    // Contactos
    tour.addStep({
      id: "inicio-contactos",
      text: t("tutorial.contacts"),
      attachTo: { element: "#inicio-contactos", on: "top" },
      buttons: [backBtn(tour, "inicio-ventas-top"), nextBtn(tour)],
    });

    // ===== Sección Facturas =====
    tour.addStep({
      id: "nav-facturas",
      text: t("tutorial.goToInvoices"),
      attachTo: { element: "a[href='/facturas']", on: "right" },
      buttons: [
        backBtn(tour, "inicio-contactos", "/inicio"),
        skipBtn(tour),
        {
          text: t("tutorial.buttons.goToInvoices"),
          classes: btnStyle,
          action: () => {
            tour.hide();
            navigate("/facturas");
            const waiter = setInterval(() => {
              if (document.querySelector(".entity-table")) {
                clearInterval(waiter);
                tour.next();
              }
            }, 100);
          },
        },
      ],
    });

    tour.addStep({
      id: "facturas-buttons",
      text: t("tutorial.selectDocType"),
      attachTo: { element: "#botones_consulta", on: "bottom-start" },
      buttons: [
        backBtn(tour, "nav-facturas", "/facturas"),
        skipBtn(tour),
        nextBtn(tour),
      ],
    });

    tour.addStep({
      id: "facturas-date",
      text: t("tutorial.enterDateRange"),
      attachTo: { element: "#botones-filtrar", on: "bottom-start" },
      buttons: [
        backBtn(tour, "facturas-buttons", "/facturas"),
        skipBtn(tour),
        nextBtn(tour),
      ],
    });

    tour.addStep({
      id: "facturas-table",
      text: t("tutorial.invoicesTable"),
      attachTo: { element: ".entity-table", on: "top" },
      buttons: [
        backBtn(tour, "facturas-date", "/facturas"),
        skipBtn(tour),
        nextBtn(tour),
      ],
    });

    tour.addStep({
      id: "facturas-detalle",
      text: t("tutorial.viewDetail"),
      attachTo: {
        element: ".entity-table tr:first-child td:last-child span",
        on: "left",
      },
      buttons: [
        backBtn(tour, "facturas-table", "/facturas"),
        skipBtn(tour),
        {
          text: t("tutorial.buttons.viewDetail"),
          classes: btnStyle,
          action: () => {
            tour.hide();
            const firstDoc = document.querySelector(
              ".entity-table tbody tr:first-child td:nth-child(2)"
            );
            if (!firstDoc) return console.error("Documento no hallado");
            const docId = firstDoc.textContent.trim();
            navigate(`/invoices/${docId}`);
            const waiter = setInterval(() => {
              if (document.querySelector(".master")) {
                clearInterval(waiter);
                tour.show("facturas-detalle-master");
              }
            }, 100);
          },
        },
      ],
    });

    tour.addStep({
      id: "facturas-detalle-master",
      text: t("tutorial.masterDetail"),
      attachTo: { element: ".master", on: "bottom" },
      buttons: [
        backBtn(tour, "facturas-detalle", "/facturas"),
        skipBtn(tour),
        nextBtn(tour),
      ],
    });

    tour.addStep({
      id: "facturas-detalle-child",
      text: t("tutorial.childDetail"),
      attachTo: { element: ".child", on: "bottom" },
      buttons: [
        backBtn(tour, "facturas-detalle-master", "/facturas"),
        endBtn(tour),
      ],
    });

    return tour;
  }, [isDark, navigate, t]);

  // Lanza el tour, asegurándose primero de navegar a /inicio
  const startTutorial = useCallback(() => {
    navigate("/inicio");
    const waiter = setInterval(() => {
      if (document.querySelector("#inicio-metricas")) {
        clearInterval(waiter);
        buildTour().start();
      }
    }, 100);
  }, [buildTour, navigate]);

  return { startTutorial };
}
