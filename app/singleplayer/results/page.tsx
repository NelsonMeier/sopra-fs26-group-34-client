"use client";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button, ConfigProvider, Table } from "antd";

interface ResultRow {
	key: string;
	round: string;
	game: "Reaction Time" | "Typing Speed";
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
	const [rows, setRows] = useState<ResultRow[]>([]);

	useEffect(() => {
		if (typeof window === "undefined") return;

		const reactionScores = toNumberArray(globalThis.sessionStorage.getItem("reactionScores"));
		const typingScores = toNumberArray(globalThis.sessionStorage.getItem("typingScores"));

		const reactionRows: ResultRow[] = reactionScores.map((score, index) => ({
			key: `reaction-${index}`,
			round: `${index + 1}.`,
			game: "Reaction Time",
			score: score === -1 ? "Failed" : `${score} ms`,
		}));

		const typingRows: ResultRow[] = typingScores.map((score, index) => ({
			key: `typing-${index}`,
			round: `${reactionRows.length + index + 1}.`,
			game: "Typing Speed",
			score: `${score} wpm`,
		}));

		setRows([...reactionRows, ...typingRows]);
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
							fontSize: "1.8rem",
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

				<Button
					type="primary"
					onClick={() => router.push("/singleplayer")}
					style={{
						backgroundColor: "#E8956D",
						borderColor: "#E8956D",
						borderRadius: "15px",
						height: "70px",
						fontSize: "1.8rem",
						fontWeight: "bold",
						color: "black",
						fontFamily: "var(--font-chewy)",
						border: "none",
						boxShadow: "0px 8px 10px rgba(0,0,0,0.2)",
					}}
				>
					Back to Games
				</Button>
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
				<ConfigProvider //without this the background color of the table is dark gray, this overrides that
					theme={{
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
								title: "Round",
								dataIndex: "round",
								key: "round",
								width: "20%",
							},
							{
								title: "Game",
								dataIndex: "game",
								key: "game",
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
						scroll={{ y: 8 * 54 }}
						locale={{ emptyText: "No session scores found." }}
					/>
				</ConfigProvider>
			</div>
		</div>
	);
};

export default ResultsPage;

