"use client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, ConfigProvider, Table, message } from "antd";

interface ResultRow {
	key: string;
	rank: string;
	player: string;
	score: string;
}

const toNumberArray = (raw: string | null): number[] => {
	if (!raw) return [];

	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];

		return parsed
			.map((value) => Number(value))
			.filter((value) => Number.isFinite(value));
	} catch {
		return [];
	}
};

const ResultsPage: React.FC = () => {
	const router = useRouter();
	const { value: userId } = useLocalStorage<string>("userId", "");
	const { value: token } = useLocalStorage<string>("token", "");
	const [rows, setRows] = useState<ResultRow[]>([]);

	useEffect(() => {
		const raw = sessionStorage.getItem("leaderboard");
		if (!raw) return;

		try {
			const parsed = JSON.parse(raw) as Record<string, number>;

			const sorted = Object.entries(parsed).sort(([, a], [, b]) => b - a);

			const newRows: ResultRow[] = sorted.map(([player, pts], i) => ({
				key: player,
				rank: `${i + 1}.`,
				player: player,
				score: `${pts} pts`,
			}))
			setRows(newRows);
		} catch (e) {
			console.error("Failed to parse leaderboard:", e);
		}
	}, []);

	return (
		<div
			style={{
				minHeight: "100vh",
				backgroundColor: "#6BAED6",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				padding: "2rem",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: "2rem",
					left: "2rem",
					display: "flex",
					gap: "1rem",
				}}
			>
				<Link href={`/users/${userId}`}>
					<Button
						type="primary"
						style={{
							backgroundColor: "#E8956D",
							borderColor: "#E8956D",
							borderRadius: "15px",
							height: "70px",
							fontSize: 30,
							fontWeight: "bold",
							color: "black",
							fontFamily: "var(--font-chewy)",
							border: "none",
							boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
						}}
					>
						Back to Profile
					</Button>
				</Link>

			</div>

			<div
				style={{
					width: "100%",
					maxWidth: "760px",
					backgroundColor: "#B8D8E8",
					borderRadius: "16px",
					padding: "1rem",
					boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
				}}
			>
				<ConfigProvider
					theme={{
						token: {
							fontFamily: "var(--font-chewy)",
							fontSize: 22,
						},
						components: {
							Table: {
								headerBg: "#B8D8E8",
								headerColor: "#000000",
								colorBgContainer: "#B8D8E8",
								borderColor: "rgba(0,0,0,0.2)",
							},
						},
					}}
				>
					<Table<ResultRow>
						columns={[
							{
								title: "Ranking",
								dataIndex: "rank",
								key: "rank",
								width: "20%",
							},
							{
								title: "Player",
								dataIndex: "player",
								key: "player",
								width: "40%",
							},
							{
								title: "Score",
								dataIndex: "score",
								key: "score",
								width: "40%",
							},
						]}
						dataSource={rows}
						pagination={false}
						locale={{ emptyText: "No session scores found." }}
					/>
				</ConfigProvider>
			</div>
		</div>
	);
};

export default ResultsPage;

